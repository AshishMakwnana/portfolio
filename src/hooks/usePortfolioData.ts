import { useCallback, useEffect, useState } from 'react';
import type { PortfolioPayload } from '../types/portfolio';

interface UsePortfolioDataResult {
  data: PortfolioPayload | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  downloadingResume: boolean;
  resumeMessage: string | null;
  downloadResume: () => Promise<void>;
}

export function usePortfolioData(): UsePortfolioDataResult {
  const [data, setData] = useState<PortfolioPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingResume, setDownloadingResume] = useState<boolean>(false);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const payload = (await response.json()) as PortfolioPayload;
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load portfolio data.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPortfolio();
  }, [fetchPortfolio]);

  const downloadResume = useCallback(async () => {
    if (downloadingResume) return;
    setDownloadingResume(true);
    setResumeMessage(null);

    try {
      const response = await fetch('/api/resume');
      if (!response.ok) {
        throw new Error(`Resume service returned HTTP ${response.status}.`);
      }
      const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
      if (!contentType.includes('application/pdf')) {
        throw new Error(
          contentType.includes('text/plain')
            ? 'The resume server is outdated. Restart it to enable PDF downloads.'
            : `Resume service returned ${contentType || 'no content type'} instead of a PDF.`,
        );
      }
      const blob = await response.blob();
      const signature = await blob.slice(0, 5).text();
      if (signature !== '%PDF-' || blob.size < 5) {
        throw new Error('The downloaded file is not a valid PDF.');
      }
      const configuredFilename =
        data?.profile.resumeFilename ?? 'Ashish-Makwana-Resume.pdf';
      const filename = `${configuredFilename
        .replace(/\.[^.]+$/, '')
        .replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setResumeMessage('Resume downloaded');
    } catch (error) {
      console.error('Resume download failed:', error);
      setResumeMessage(
        error instanceof Error ? error.message : 'Unable to download resume.',
      );
    } finally {
      setDownloadingResume(false);
      window.setTimeout(() => setResumeMessage(null), 8000);
    }
  }, [data?.profile.resumeFilename, downloadingResume]);

  return {
    data,
    loading,
    error,
    refetch: fetchPortfolio,
    downloadingResume,
    resumeMessage,
    downloadResume,
  };
}
