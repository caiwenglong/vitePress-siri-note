<template>
    <div class="wgt-list">
        <template v-if="listData">
            <n-grid x-gap="12" :cols="3">
                <template v-for="item in listData">
                    <n-gi>
                        <n-thing>
                            <template v-if="thingOption.avatar" #avatar>
                                <n-avatar :src="item.icon" size="small">
                                </n-avatar>
                            </template>
                            <template v-if="thingOption.header" #header>
                                {{ item.name }}
                            </template>
                            <template v-if="thingOption.headerExtra" #header-extra>
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <n-button circle size="small" @Click="navigationTo(item.url)">
                                            <template #icon>
                                                <ArrowRedo />
                                            </template>
                                        </n-button>
                                    </template>
                                    <span class="tip-text">跳转到该网站</span>
                                </n-tooltip>

                            </template>

                            <div>
                                {{ item.describe }}
                            </div>
                            <template v-if="thingOption.action" #action>
                                <n-space justify="center">
                                    <n-tooltip trigger="hover">
                                        <template #trigger>
                                            <n-button size="small">
                                                <template #icon>
                                                    <n-icon>
                                                        <ThumbsUp></ThumbsUp>
                                                    </n-icon>
                                                </template>
                                            </n-button>
                                        </template>
                                        <span class="tip-text">赞一下</span>
                                    </n-tooltip>

                                    <n-tooltip trigger="hover">
                                        <template #trigger>
                                            <n-button size="small">
                                                <template #icon>
                                                    <n-icon>
                                                        <ThumbsDown></ThumbsDown>
                                                    </n-icon>
                                                </template>
                                            </n-button>
                                        </template>
                                        <span class="tip-text">踩一下</span>
                                    </n-tooltip>

                                </n-space>
                            </template>
                        </n-thing>
                    </n-gi>
                </template>
            </n-grid>
        </template>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import {
    ArrowRedoOutline as ArrowRedo,
    ThumbsUp,
    ThumbsDownOutline as ThumbsDown
} from '@vicons/ionicons5'

defineProps({
    listData: ({
        type: String,
        default: []
    })
})
const thingOption = {
    avatar: ref(true),
    header: ref(true),
    headerExtra: ref(true),
    description: ref(true),
    footer: ref(true),
    action: ref(true)
}

const navigationTo = (url) => {
    window.open(url, '_blank')
}
</script>
  
<style scoped>
.wgt-list {
    padding: 12px;
}

.n-card {
    max-width: 300px;
}
</style>