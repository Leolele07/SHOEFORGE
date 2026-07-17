/**
 * 截图工具函数
 */

/**
 * 从Canvas元素捕获截图
 */
export function captureCanvasScreenshot(
  canvas: HTMLCanvasElement,
  width?: number,
  height?: number
): string {
  // 如果指定了尺寸，创建临时canvas进行缩放
  if (width && height) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0, width, height);
      return tempCanvas.toDataURL('image/png');
    }
  }
  
  // 直接返回原始canvas的截图
  return canvas.toDataURL('image/png');
}

/**
 * 从Three.js渲染器捕获截图
 */
export function captureThreeJSScreenshot(
  renderer: THREE.WebGLRenderer,
  width?: number,
  height?: number
): string {
  const canvas = renderer.domElement;
  return captureCanvasScreenshot(canvas, width, height);
}

/**
 * 下载截图
 */
export function downloadScreenshot(
  dataUrl: string,
  filename: string = `shoe-design-${Date.now()}.png`
): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * 捕获并下载截图
 */
export function captureAndDownloadScreenshot(
  canvas: HTMLCanvasElement,
  width?: number,
  height?: number,
  filename?: string
): void {
  const dataUrl = captureCanvasScreenshot(canvas, width, height);
  downloadScreenshot(dataUrl, filename);
}

/**
 * 将截图转换为Blob
 */
export function screenshotToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * 捕获高清截图（2倍分辨率）
 */
export function captureHDScreenshot(
  canvas: HTMLCanvasElement
): string {
  const width = canvas.width * 2;
  const height = canvas.height * 2;
  return captureCanvasScreenshot(canvas, width, height);
}

// 导入Three.js类型
import * as THREE from 'three';
