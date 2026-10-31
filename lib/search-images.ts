import {bikes, featuredSlugs, type Bike} from './catalog';
import {galleries} from './galleries';

/** Only actual page/gallery images, using the same URLs as the visible content. */
export function productImagePaths(bike: Bike): string[] {
 return [...new Set([`/media/${bike.image}.webp`, ...(galleries[bike.slug] ?? []).map(photo => photo.src)])];
}
export function listedBikes(path: string): Bike[] {
 const sk = path.replace(/^\/en(?=\/|$)/, '') || '/';
 if (sk === '/bicykle') return bikes;
 if (sk === '/') return bikes.filter(bike => featuredSlugs.includes(bike.slug));
 return [];
}
export function pageImagePaths(path: string): string[] {
 const sk = path.replace(/^\/en(?=\/|$)/, '') || '/';
 const bike = bikes.find(bike => sk === `/bicykle/${bike.slug}`);
 if (bike) return productImagePaths(bike);
 const covers = listedBikes(path).map(bike => `/media/${bike.image}.webp`);
 return sk === '/' ? [...covers, '/media/hero.webp', '/media/family.webp', '/media/story.webp'] : covers;
}
export function coverImage(bike: Bike) {
 const path = `/media/${bike.image}.webp`;
 const photo = galleries[bike.slug]?.find(photo => photo.src === path);
 return {path, ...(photo ? {width: photo.width, height: photo.height} : {})};
}
