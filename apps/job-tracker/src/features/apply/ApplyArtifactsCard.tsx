import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from '../../i18n/Provider';
import { ApplyArtifactPreview } from './ApplyArtifactPreview';
import { ApplyReviewCard } from './ApplyReviewCard';

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
    <>
      <ApplyReviewCard title={messages.apply.review.artifactsTitle}>
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
      </ApplyReviewCard>
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
    </>
  );
}
