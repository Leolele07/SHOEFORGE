/**
 * 截图工具函数
 */

import * as THREE from 'three';

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
  // 规范做法：先挂载到 DOM 再触发下载，然后移除
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
 * 捕获高清截图（通过 Three.js renderer 重新渲染实现真正的 2x 分辨率）
 *
 * 原理：
 * 1. 保存当前 renderer 和 camera 的原始尺寸
 * 2. 将 renderer 尺寸设为 2x，同时更新 camera aspect 和投影矩阵
 * 3. 执行一次渲染
 * 4. 从 canvas 截取图像
 * 5. 恢复 renderer 和 camera 到原始状态，并再次渲染
 */
export function captureHDScreenshotFromRenderer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  scale: number = 2
): string {
  const canvas = renderer.domElement;
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  const hdWidth = originalWidth * scale;
  const hdHeight = originalHeight * scale;

  // 保存原始 pixelRatio 并设为 1（避免 DPR 叠加导致尺寸过大）
  const originalPixelRatio = renderer.getPixelRatio();
  renderer.setPixelRatio(1);

  // 设置 renderer 到高清尺寸
  renderer.setSize(hdWidth, hdHeight, false);

  // 如果是透视相机，更新宽高比和投影矩阵
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = hdWidth / hdHeight;
    camera.updateProjectionMatrix();
  }

  // 以高清尺寸渲染一帧
  renderer.render(scene, camera);

  // 截取高清图像
  const dataUrl = captureCanvasScreenshot(canvas);

  // 恢复原始状态
  renderer.setPixelRatio(originalPixelRatio);
  renderer.setSize(originalWidth, originalHeight, false);

  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = originalWidth / originalHeight;
    camera.updateProjectionMatrix();
  }

  // 恢复渲染
  renderer.render(scene, camera);

  return dataUrl;
}

/**
 * 捕获高清截图（纯 Canvas 版本 — 仅做上采样，适合没有 renderer 引用的场景）
 * 注意：这不会提高实际渲染质量，仅放大已有像素。
 */
export function captureHDScreenshot(
  canvas: HTMLCanvasElement
): string {
  const width = canvas.width * 2;
  const height = canvas.height * 2;
  return captureCanvasScreenshot(canvas, width, height);
}
