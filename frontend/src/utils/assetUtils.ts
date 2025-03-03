// 导入所有图片资源
const imageContext = import.meta.glob<{ default: string }>([
  '/src/assets/images/**/*.png',
  '/src/assets/images/**/*.jpg',
  '/src/assets/images/**/*.jpeg',
  '/src/assets/images/**/*.gif',
  '/src/assets/images/**/*.webp',
]);

// 默认图片路径
const DEFAULT_IMAGE = '/src/assets/images/default.jpg';

// 图片缓存
const imageCache: { [key: string]: string } = {};

/**
 * 获取资源路径
 * @param imageName 图片名称或URL
 * @returns 图片路径
 */
export const getAssetPath = async (imageName: string): Promise<string> => {
  // 如果是URL，直接返回
  if (!imageName || imageName.startsWith('http')) {
    return imageName || DEFAULT_IMAGE;
  }

  // 检查缓存
  if (imageCache[imageName]) {
    return imageCache[imageName];
  }

  // 处理相对路径
  const normalizedPath = imageName
    .replace(/^\.\.\/\.\.\//, '/src/') // 将 ../../ 替换为 /src/
    .replace(/^\.\//, '/src/assets/images/'); // 将 ./ 替换为 /src/assets/images/
  
  try {
    // 尝试加载图片
    if (imageContext[normalizedPath]) {
      const module = await imageContext[normalizedPath]();
      imageCache[imageName] = module.default;
      return module.default;
    }

    // 如果找不到图片，尝试不同的扩展名
    const pathWithoutExt = normalizedPath.replace(/\.[^/.]+$/, '');
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    for (const ext of extensions) {
      const pathWithExt = `${pathWithoutExt}${ext}`;
      if (imageContext[pathWithExt]) {
        const module = await imageContext[pathWithExt]();
        imageCache[imageName] = module.default;
        return module.default;
      }
    }

    console.warn(`Image not found: ${imageName}`);
    return DEFAULT_IMAGE;
  } catch (error) {
    console.error(`Error loading image: ${imageName}`, error);
    return DEFAULT_IMAGE;
  }
};

/**
 * 预加载图片
 * @param imageNames 图片名称数组
 */
export const preloadImages = async (imageNames: string[]): Promise<void> => {
  await Promise.all(
    imageNames.map(async (name) => {
      if (!imageCache[name]) {
        await getAssetPath(name);
      }
    })
  );
};

/**
 * 清除图片缓存
 */
export const clearImageCache = (): void => {
  Object.keys(imageCache).forEach((key) => {
    delete imageCache[key];
  });
}; 