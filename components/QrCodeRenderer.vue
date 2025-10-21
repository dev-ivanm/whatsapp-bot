<template>
  <div ref="qrContainer" style="padding: 20px;"></div>
</template>

<script setup>
import { defineProps, watch, ref, onMounted } from 'vue';
import qrcode from 'qrcode-generator';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const qrContainer = ref(null);

const renderQrCode = (qrText) => {
  if (!qrText || !qrContainer.value) return;

  qrContainer.value.innerHTML = '';

  const qr = qrcode(0, 'H'); 
  qr.addData(qrText);
  qr.make();

  const imgTag = qr.createImgTag(5, 10); 
  qrContainer.value.innerHTML = imgTag;
  
  const imgElement = qrContainer.value.querySelector('img');
  if (imgElement) {
    imgElement.style.width = '300px';
    imgElement.style.height = '300px';
  }
};

watch(() => props.text, (newText) => {
  renderQrCode(newText);
}, { immediate: true });

onMounted(() => {
  renderQrCode(props.text);
});
</script>