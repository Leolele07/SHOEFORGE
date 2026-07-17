import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ShoeScene } from '@/components/scene/ShoeScene';
import { ToastContainer } from '@/components/Toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';

export const App: React.FC = () => {
  useKeyboardShortcuts();
  useAutoSave();

  return (
    <>
      <MainLayout>
        <ShoeScene />
      </MainLayout>
      <ToastContainer />
    </>
  );
};
