<template>
  <div v-if="!hasData" class="upload-container">
    <div
      class="upload-zone"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :class="{ dragover: isDragging }"
    >
      <div class="upload-icon">📁</div>
      <h2>Drag and drop your CSV files</h2>
      <p>Import your Migros exports to start the analysis</p>
      <button class="btn-primary">Select files</button>
      <input
        type="file"
        ref="fileInput"
        class="file-input"
        multiple
        accept=".csv"
        @change="handleFileSelect"
      >
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'FileUpload',
  props: {
    hasData: {
      type: Boolean,
      required: true
    }
  },
  emits: ['files-selected'],
  setup(props, { emit }) {
    const isDragging = ref(false);
    const fileInput = ref(null);

    function triggerFileInput() {
      fileInput.value.click();
    }

    function handleDragOver() {
      isDragging.value = true;
    }

    function handleDragLeave() {
      isDragging.value = false;
    }

    function handleDrop(e) {
      isDragging.value = false;
      const files = e.dataTransfer.files;
      emit('files-selected', files);
    }

    function handleFileSelect(e) {
      const files = e.target.files;
      emit('files-selected', files);
    }

    return {
      isDragging,
      fileInput,
      triggerFileInput,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileSelect
    };
  }
};
</script>
