#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function updatePackageJson(rootDir, relPath, newVersion) {
  const fullPath = path.join(rootDir, relPath);
  const json = readJson(fullPath);

  const oldVersion = json.version;
  if (!oldVersion) {
    throw new Error(`No "version" field found in ${relPath}`);
  }

  json.version = newVersion;
  writeJson(fullPath, json);
  console.log(`Updated ${relPath} version: ${oldVersion} -> ${newVersion}`);

  return oldVersion;
}

function updatePackageLock(rootDir, relPath, newVersion) {
  const fullPath = path.join(rootDir, relPath);
  const json = readJson(fullPath);

  const oldVersion = json.version;
  json.version = newVersion;

  if (json.packages && json.packages['']) {
    json.packages[''].version = newVersion;
  }

  writeJson(fullPath, json);
  console.log(`Updated ${relPath} lockfile version: ${oldVersion} -> ${newVersion}`);
}

function updateEnvFile(rootDir, relPath, oldVersion, newVersion) {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  let changed = false;
  const updated = content
    .split('\n')
    .map((line) => {
      if (line.startsWith('NEXT_PUBLIC_VERSION=')) {
        if (line.includes(oldVersion)) {
          changed = true;
          return `NEXT_PUBLIC_VERSION=${newVersion}`;
        }
      }
      return line;
    })
    .join('\n');

  if (!changed) {
    console.warn(`WARN: NEXT_PUBLIC_VERSION with ${oldVersion} not found in ${relPath}`);
    return;
  }

  fs.writeFileSync(fullPath, updated, 'utf8');
  console.log(`Updated ${relPath} NEXT_PUBLIC_VERSION: ${oldVersion} -> ${newVersion}`);
}

function updateHelmValuesFile(rootDir, relPath, oldVersion, newVersion) {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  let changed = false;
  const updated = content
    .split('\n')
    .map((line) => {
      if (line.includes('tag:') && line.includes(oldVersion)) {
        changed = true;
        return line.replace(oldVersion, newVersion);
      }
      return line;
    })
    .join('\n');

  if (!changed) {
    console.warn(`WARN: No tag lines with ${oldVersion} found in ${relPath}`);
    return;
  }

  fs.writeFileSync(fullPath, updated, 'utf8');
  console.log(`Updated ${relPath} image tags: ${oldVersion} -> ${newVersion}`);
}

function main() {
  const [, , newVersion] = process.argv;

  if (!newVersion) {
    console.error('Usage: node scripts/bump-version.cjs <newVersion>');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');

  // 1) Determine old version from root package.json and update all package.json files
  const oldVersion = updatePackageJson(rootDir, 'package.json', newVersion);

  ['frontend/package.json', 'microservices/package.json'].forEach((relPath) => {
    updatePackageJson(rootDir, relPath, newVersion);
  });

  // 2) Update package-lock.json files (only project-level fields)
  [
    'package-lock.json',
    'frontend/package-lock.json',
    'microservices/package-lock.json',
  ].forEach((relPath) => {
    updatePackageLock(rootDir, relPath, newVersion);
  });

  // 3) Update NEXT_PUBLIC_VERSION in env files
  [
    '.env',
    '.env.local',
    'frontend/.env',
    'frontend/.env.local',
    'microservices/.env.local',
    'microservices/.env.testing',
  ].forEach((relPath) => {
    updateEnvFile(rootDir, relPath, oldVersion, newVersion);
  });

  // 4) Update image tags in Helm values files
  [
    'k8s/helm/values-edag-dev.yaml',
    'k8s/helm/values-hcloud-mkk.yaml',
    'k8s/helm/values-hcloud-staging.yaml',
    'k8s/helm/values-hcloud.yaml',
    'k8s/helm/values-infrastructure.yaml',
  ].forEach((relPath) => {
    updateHelmValuesFile(rootDir, relPath, oldVersion, newVersion);
  });

  console.log(`Done. Version updated from ${oldVersion} to ${newVersion}.`);
}

main();

