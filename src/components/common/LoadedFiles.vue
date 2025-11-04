<template>
  <div class="loaded-files fade-in">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3>Loaded files</h3>
      <button
        class="btn-primary"
        style="padding: 0.5rem 1rem; font-size: 0.875rem;"
        @click="$emit('add-files')"
      >
        + Add files
      </button>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
      <div
        v-for="file in files"
        :key="file"
        class="file-tag"
        style="display: flex; align-items: center; gap: 0.5rem;"
      >
        {{ file }}
        <button
          @click="$emit('remove-file', file)"
          style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0; font-size: 1.2rem;"
          title="Remove this file"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadedFiles',
  props: {
    files: {
      type: Array,
      required: true
    }
  },
  emits: ['add-files', 'remove-file']
};
</script>
