import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const sourceRoot = path.resolve('apps/web/src');
const maxProps = 6;
const maxBooleanProps = 2;
const maxTsxLines = 180;

function isBooleanType(typeNode) {
  if (!typeNode) {
    return false;
  }

  if (
    typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
    (ts.isLiteralTypeNode(typeNode) &&
      [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(
        typeNode.literal.kind,
      ))
  ) {
    return true;
  }

  return ts.isUnionTypeNode(typeNode) && typeNode.types.some(isBooleanType);
}

function analyzeSourceFile(sourceFile) {
  const findings = [];
  const relativePath = path
    .relative(process.cwd(), sourceFile.fileName)
    .replace(/\\/g, '/');

  if (sourceFile.fileName.endsWith('.tsx')) {
    const lineCount =
      sourceFile.text.split(/\r?\n/).length -
      Number(sourceFile.text.endsWith('\n'));
    if (lineCount > maxTsxLines) {
      findings.push(
        `${relativePath}: TSX file has ${lineCount} lines (limit: ${maxTsxLines}).`,
      );
    }
  }

  function visit(node) {
    let members;
    let name;

    if (ts.isInterfaceDeclaration(node)) {
      members = node.members;
      name = node.name.text;
    } else if (
      ts.isTypeAliasDeclaration(node) &&
      ts.isTypeLiteralNode(node.type)
    ) {
      members = node.type.members;
      name = node.name.text;
    }

    if (name?.endsWith('Props')) {
      const props = members.filter(
        (member) =>
          ts.isPropertySignature(member) || ts.isMethodSignature(member),
      );
      const booleanProps = props.filter((prop) => isBooleanType(prop.type));

      if (props.length > maxProps) {
        findings.push(
          `${relativePath}: ${name} has ${props.length} props (limit: ${maxProps}).`,
        );
      }

      if (booleanProps.length > maxBooleanProps) {
        findings.push(
          `${relativePath}: ${name} has ${booleanProps.length} boolean props (limit: ${maxBooleanProps}).`,
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

function getSourceFiles() {
  return ts.sys
    .readDirectory(
      sourceRoot,
      ['.ts', '.tsx'],
      [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    )
    .toSorted();
}

function main() {
  const files = process.argv.slice(2).length
    ? process.argv.slice(2).map((file) => path.resolve(file))
    : getSourceFiles();
  const findings = files.flatMap((file) => {
    const sourceFile = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    return analyzeSourceFile(sourceFile);
  });

  if (findings.length > 0) {
    console.error(findings.join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log('No React prop or TSX size issues found.');
}

main();
