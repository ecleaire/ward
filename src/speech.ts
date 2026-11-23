/** Speak identifiers as English words; retain their exact spelling on screen. */
export function speechText(word: string): string {
  const special: Record<string, string> = {
    HSV: 'H S V', IMU: 'I M U', PID: 'P I D',
    GPUParticles2D: 'G P U particles two D',
    VBoxContainer: 'V box container', HBoxContainer: 'H box container',
    '@onready': 'on ready', Vector2: 'vector two', var: 'var', const: 'const', func: 'func',
    int: 'int', bool: 'bool', enum: 'enum',
  };
  if (special[word]) return special[word];
  return word.replace(/^[@_]+/, '')
    .replace(/2D\b/g, ' two D')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}
