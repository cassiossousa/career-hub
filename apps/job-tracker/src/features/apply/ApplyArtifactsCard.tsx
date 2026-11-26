import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { ApplyArtifactPreview } from './ApplyArtifactPreview';

interface ApplyArtifactsCardProps {
  runId: number;
  artifactNames: string[];
}

export function ApplyArtifactsCard({
  runId,
  artifactNames,
}: ApplyArtifactsCardProps) {
  const { messages } = useTranslation();
  const [previewArtifact, setPreviewArtifact] = useState<string | null>(null);

  if (artifactNames.length === 0) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography component="h2" variant="h6">
            {messages.apply.review.artifactsTitle}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {artifactNames.map((name) => (
              <Button
                key={name}
                size="small"
                variant="outlined"
                onClick={() => {
                  setPreviewArtifact(name);
                }}
              >
                {name}
              </Button>
            ))}
          </Stack>
        </Stack>
      </CardContent>
      {previewArtifact !== null && (
        <ApplyArtifactPreview
          runId={runId}
          name={previewArtifact}
          open
          onClose={() => {
            setPreviewArtifact(null);
          }}
        />
      )}
    </Card>
  );
}
