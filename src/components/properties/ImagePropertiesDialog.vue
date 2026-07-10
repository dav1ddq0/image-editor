<!--
  Read-only "Image Properties" modal. Shows the file-level metadata the browser
  exposes (name, format, size, modified date, dimensions) plus EXIF data
  (camera, capture settings and GPS location when present).
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useEditorStore } from '@/stores/editorStore'
import {
  formatFileSize, formatDateTime, formatFormat, formatCamera,
  formatExposure, formatAperture, formatFocalLength, formatCoords, mapLink,
} from '@/utils/imageExifMetadata'

const props = defineProps<{ visible: boolean }>()
const emit  = defineEmits<{ 'update:visible': [value: boolean] }>()

const theme  = useTheme()
const editor = useEditorStore()

const dialog = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

interface Row { label: string; value: string; href?: string }
interface Group { title: string; rows: Row[] }

const dims = computed(() => editor.originalImage ?? editor.image)

const groups = computed<Group[]>(() => {
  const meta = editor.sourceMeta
  if (!meta) return []
  const out: Group[] = []

  // File
  out.push({
    title: 'File',
    rows: [
      { label: 'Name',          value: meta.name },
      { label: 'Format',        value: formatFormat(meta.type, meta.name) },
      { label: 'File size',     value: formatFileSize(meta.size) },
      { label: 'Last modified', value: formatDateTime(meta.lastModified) },
    ],
  })

  // Image
  if (dims.value) {
    const mp = (dims.value.width * dims.value.height) / 1_000_000
    out.push({
      title: 'Image',
      rows: [
        { label: 'Dimensions', value: `${dims.value.width} × ${dims.value.height} px` },
        { label: 'Resolution', value: `${mp.toFixed(1)} MP` },
      ],
    })
  }

  // Camera (EXIF)
  const e = meta.exifInfo
  {
    const rows: Row[] = []
    const camera = formatCamera(e.make, e.model)
    if (camera)                     rows.push({ label: 'Camera',       value: camera })
    if (e.lens)                     rows.push({ label: 'Lens',         value: e.lens })
    if (e.dateTaken)                rows.push({ label: 'Date taken',   value: formatDateTime(e.dateTaken) })
    if (e.iso != null)              rows.push({ label: 'ISO',          value: `ISO ${e.iso}` })
    const ap = formatAperture(e.fNumber)
    if (ap)                         rows.push({ label: 'Aperture',     value: ap })
    const ex = formatExposure(e.exposureTime)
    if (ex)                         rows.push({ label: 'Exposure',     value: ex })
    const fl = formatFocalLength(e.focalLength)
    if (fl)                         rows.push({ label: 'Focal length', value: fl })
    if (rows.length) out.push({ title: 'Camera', rows })
  }

  // Location (GPS)
  if (e?.latitude != null && e?.longitude != null) {
    out.push({
      title: 'Location',
      rows: [
        { label: 'Coordinates', value: formatCoords(e.latitude, e.longitude) },
        { label: 'Map',         value: 'View on OpenStreetMap', href: mapLink(e.latitude, e.longitude) },
      ],
    })
  }

  return out
})

function close(): void {
  emit('update:visible', false)
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="460" scrollable :theme="theme.name.value" aria-label="Image Properties">
    <v-card>

      <v-card-title class="d-flex align-center justify-space-between">
        <span>Image Properties</span>
        <v-btn variant="text" icon="mdi-close" size="small" density="comfortable" aria-label="Close" @click="close" />
      </v-card-title>

      <v-card-text class="props-body">
        <section v-for="group in groups" :key="group.title" class="props-group">
          <h3 class="props-group-title">{{ group.title }}</h3>
          <div v-for="row in group.rows" :key="row.label" class="props-row">
            <span class="props-label">{{ row.label }}</span>
            <a v-if="row.href" class="props-value props-link" :href="row.href" target="_blank" rel="noopener noreferrer">
              {{ row.value }}
              <v-icon icon="mdi-open-in-new" size="13" />
            </a>
            <span v-else class="props-value">{{ row.value }}</span>
          </div>
        </section>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.props-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.props-group {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.props-group-title {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin-bottom: 12px;
}

.props-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
}
.props-row + .props-row {
  border-top: 1px solid color-mix(in oklab, var(--color-border) 55%, transparent);
}

.props-label {
  font-size: 0.72rem;
  color: var(--color-muted);
}

.props-value {
  font-size: 0.92rem;
  color: var(--color-text);
  word-break: break-word;
}

.props-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-accent);
  text-decoration: none;
  width: fit-content;
}
.props-link:hover { text-decoration: underline; }
</style>
