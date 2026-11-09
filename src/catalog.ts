import { CATEGORY, TERMS, type Category, type Term } from './terms';
import { GODOT_CATEGORY, GODOT_TERMS } from './godot-terms';

export type ModeId = 'pybricks' | 'godot';
export type Catalog = { id: ModeId; label: string; brand: string; description: string; docs: string; terms: Term[]; categories: Category[] };
export const CATEGORIES = { ...CATEGORY, ...GODOT_CATEGORY };
export const CATALOGS: Record<ModeId, Catalog> = {
  pybricks: { id: 'pybricks', label: 'Pybricks', brand: 'PYBRICKS', description: 'Pybricks の公式ドキュメントでよく使う単語', docs: 'https://docs.pybricks.com/en/latest/', terms: TERMS, categories: ['Motor', 'Sensor', 'Drive', 'Hub', 'Core'] },
  godot: { id: 'godot', label: 'Godot', brand: 'GODOT 2D', description: 'Godot 4 の2Dノード・GDScriptの構文・関数・変数', docs: 'https://docs.godotengine.org/ja/stable/', terms: GODOT_TERMS, categories: ['Scene', 'Script', 'GodotAPI', 'Visual', 'Interface'] },
};
export const MODE_KEY = 'word-lab-mode';
export function readMode(storage: Pick<Storage, 'getItem'>): ModeId {
  try { return storage.getItem(MODE_KEY) === 'godot' ? 'godot' : 'pybricks'; } catch { return 'pybricks'; }
}
