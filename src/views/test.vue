<template>
    <div class="video-stream-viewer">
        <select v-model="selectedStream">
            <option value="test">Stream 1</option>
        </select>
        <img :src="videoFeedUrl" alt="Video Stream" @error="handleImageError" />
    </div>
</template>
<script>    
export default {
    name: 'VideoStreamViewer',
    data() {
        return {
            selectedStream: 'test',
            videoFeedBaseUrl: 'http://127.0.0.1:5000/stream/'
        };
    },
    computed: {
        videoFeedUrl() {
            return `${this.videoFeedBaseUrl}${this.selectedStream}`;
        }
    },
    methods: {
        handleImageError() {
            console.error('Failed to load the video stream image.');
        }
    }
};
</script>