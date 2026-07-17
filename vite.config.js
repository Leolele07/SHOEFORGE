import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('three')) {
                        return 'three';
                    }
                    if (id.includes('@react-three')) {
                        return 'react-three';
                    }
                },
            },
        },
    },
    optimizeDeps: {
        include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
});
