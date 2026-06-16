const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'auth-store.json');

const defaultState = {
  businessesByGst: {},
  businessesById: {},
  otpsByBusinessId: {},
  usersByEmail: {},
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadState() {
  ensureDataDir();
  if (!fs.existsSync(STORE_FILE)) {
    return structuredClone(defaultState);
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  ensureDataDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

module.exports = {
  loadState,
  saveState,
};
