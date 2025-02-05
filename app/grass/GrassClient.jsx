'use client';

import dynamic from 'next/dynamic';

const GrassExportBlock = dynamic(
  () => import('./GrassExportBlock'),
  { ssr: false }
);

export default function GrassClient() {
  return <GrassExportBlock />;
}