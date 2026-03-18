<template>
  <div class="editor-layout">

    <!-- Top Navbar -->
    <header class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">🖼️</span>
        <span class="brand-name">Image Editor</span>
      </div>
      <div class="navbar-actions">
        <button class="btn btn-secondary">Open Image</button>
        <button class="btn btn-primary">Save</button>
        <button class="btn btn-secondary">Export</button>
      </div>
    </header>

    <div class="editor-body">

      <!-- Left Toolbar (tools) -->
      <aside class="toolbar-left">
        <div class="tool-group">
          <button class="tool-btn active" title="Select">
            <span>↖</span>
          </button>
          <button class="tool-btn" title="Crop">
            <span>⊡</span>
          </button>
          <button class="tool-btn" title="Brush">
            <span>🖌</span>
          </button>
          <button class="tool-btn" title="Eraser">
            <span>◻</span>
          </button>
          <button class="tool-btn" title="Text">
            <span>T</span>
          </button>
          <button class="tool-btn" title="Shapes">
            <span>◯</span>
          </button>
          <button class="tool-btn" title="Fill">
            <span>🪣</span>
          </button>
          <button class="tool-btn" title="Zoom In">
            <span>🔍</span>
          </button>
        </div>
        <div class="tool-group">
          <button class="tool-btn" title="Undo">
            <span>↩</span>
          </button>
          <button class="tool-btn" title="Redo">
            <span>↪</span>
          </button>
        </div>
      </aside>

      <!-- Canvas Area -->
      <main class="canvas-area">
        <div class="canvas-container">
          <div class="canvas-placeholder">
            <div class="drop-zone">
              <span class="drop-icon">📂</span>
              <p>Drop an image here or click <strong>Open Image</strong></p>
              <p class="drop-hint">Supports JPG, PNG, GIF, WEBP</p>
            </div>
          </div>
        </div>
        <!-- Bottom zoom/info bar -->
        <div class="canvas-statusbar">
          <span>Zoom: 100%</span>
          <span>—</span>
          <span>No image loaded</span>
          <span class="spacer"></span>
          <span>W: — &nbsp; H: —</span>
        </div>
      </main>

      <!-- Right Panel (adjustments) -->
      <aside class="panel-right">
        <div class="panel-section">
          <h3 class="panel-title">Adjustments</h3>
          <div class="adjustment-row">
            <label>Brightness</label>
            <input type="range" min="-100" max="100" value="0" disabled />
            <span class="value-label">0</span>
          </div>
          <div class="adjustment-row">
            <label>Contrast</label>
            <input type="range" min="-100" max="100" value="0" disabled />
            <span class="value-label">0</span>
          </div>
          <div class="adjustment-row">
            <label>Saturation</label>
            <input type="range" min="-100" max="100" value="0" disabled />
            <span class="value-label">0</span>
          </div>
          <div class="adjustment-row">
            <label>Sharpness</label>
            <input type="range" min="0" max="100" value="0" disabled />
            <span class="value-label">0</span>
          </div>
          <div class="adjustment-row">
            <label>Blur</label>
            <input type="range" min="0" max="100" value="0" disabled />
            <span class="value-label">0</span>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Filters</h3>
          <div class="filters-grid">
            <div class="filter-thumb" title="None">None</div>
            <div class="filter-thumb sepia" title="Sepia">Sepia</div>
            <div class="filter-thumb grayscale" title="Grayscale">B&W</div>
            <div class="filter-thumb vivid" title="Vivid">Vivid</div>
            <div class="filter-thumb cool" title="Cool">Cool</div>
            <div class="filter-thumb warm" title="Warm">Warm</div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="panel-title">Transform</h3>
          <div class="transform-actions">
            <button class="btn btn-small btn-secondary" disabled>Rotate L</button>
            <button class="btn btn-small btn-secondary" disabled>Rotate R</button>
            <button class="btn btn-small btn-secondary" disabled>Flip H</button>
            <button class="btn btn-small btn-secondary" disabled>Flip V</button>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>

<style scoped>
/* Layout */
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #16213e;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid #0f3460;
  flex-shrink: 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #e94560;
}

.brand-icon {
  font-size: 1.4rem;
}

.navbar-actions {
  display: flex;
  gap: 10px;
}

/* Body */
.editor-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Left Toolbar */
.toolbar-left {
  width: 56px;
  background: #16213e;
  border-right: 1px solid #0f3460;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
}

.tool-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  border-bottom: 1px solid #0f3460;
  width: 100%;
}

.tool-group:last-child {
  border-bottom: none;
}

.tool-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #a0a0b0;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tool-btn:hover {
  background: #0f3460;
  color: #ffffff;
  border-color: #e94560;
}

.tool-btn.active {
  background: #e94560;
  color: #ffffff;
  border-color: #e94560;
}

/* Canvas Area */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d0d1a;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;
}

.canvas-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone {
  border: 2px dashed #0f3460;
  border-radius: 12px;
  padding: 60px 80px;
  text-align: center;
  color: #606080;
  transition: border-color 0.2s;
}

.drop-zone:hover {
  border-color: #e94560;
  color: #a0a0c0;
}

.drop-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 16px;
}

.drop-zone p {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.drop-hint {
  font-size: 0.8rem !important;
  color: #404060 !important;
}

.canvas-statusbar {
  height: 28px;
  background: #16213e;
  border-top: 1px solid #0f3460;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
  font-size: 0.78rem;
  color: #606080;
  flex-shrink: 0;
}

.spacer {
  flex: 1;
}

/* Right Panel */
.panel-right {
  width: 240px;
  background: #16213e;
  border-left: 1px solid #0f3460;
  overflow-y: auto;
  flex-shrink: 0;
}

.panel-section {
  padding: 16px;
  border-bottom: 1px solid #0f3460;
}

.panel-title {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #e94560;
  margin-bottom: 14px;
}

.adjustment-row {
  display: grid;
  grid-template-columns: 80px 1fr 32px;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.adjustment-row label {
  font-size: 0.82rem;
  color: #a0a0b0;
}

.adjustment-row input[type="range"] {
  accent-color: #e94560;
  width: 100%;
}

.value-label {
  font-size: 0.78rem;
  color: #606080;
  text-align: right;
}

/* Filters */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.filter-thumb {
  aspect-ratio: 1;
  border-radius: 6px;
  background: #0d0d1a;
  border: 2px solid #0f3460;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #606080;
  cursor: pointer;
  transition: border-color 0.15s;
}

.filter-thumb:hover {
  border-color: #e94560;
  color: #e0e0e0;
}

.filter-thumb.sepia { filter: sepia(0.8); background: #3d2b1f; }
.filter-thumb.grayscale { filter: grayscale(1); background: #2a2a2a; }
.filter-thumb.vivid { background: linear-gradient(135deg, #e94560, #0f3460); }
.filter-thumb.cool { background: linear-gradient(135deg, #1a6b8a, #0f3460); }
.filter-thumb.warm { background: linear-gradient(135deg, #c96a1a, #e94560); }

/* Transform */
.transform-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* Buttons */
.btn {
  padding: 7px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.15s;
}

.btn:hover {
  opacity: 0.85;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-primary {
  background: #e94560;
  color: #fff;
}

.btn-secondary {
  background: #0f3460;
  color: #e0e0e0;
}

.btn-small {
  padding: 5px 10px;
  font-size: 0.78rem;
}
</style>
