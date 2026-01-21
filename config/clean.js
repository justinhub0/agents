import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const directories = [
  rootDir,
  path.resolve(rootDir, 'packages', 'data-provider'),
  path.resolve(rootDir, 'client'),
  path.resolve(rootDir, 'api'),
];

/** @param {string} dir */
function deleteNodeModules(dir) {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`Deleting node_modules in ${dir}...`);
    try {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      console.log(`Deleted node_modules in ${dir}`);
    } catch (error) {
      console.error(`Error deleting node_modules in ${dir}:`, error.message);
    }
  }
}

function cleanNpmCache() {
  console.log('Cleaning npm cache...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('npm cache cleaned successfully.');
  } catch (error) {
    console.error('Error cleaning npm cache:', error.message);
  }
}

directories.forEach(deleteNodeModules);

cleanNpmCache();
