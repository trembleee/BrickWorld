<template>
    <div>
        <v-app-bar app color="#4da5ff" dark>
            <div class="d-flex align-center">
                <v-img alt="Vuetify Logo" class="shrink mr-2" contain
                    src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png" transition="scale-transition"
                    width="40" />
                <span style="color: white; font-weight: 700; font-size: large;">BrickWorld</span>
            </div>

            <v-spacer></v-spacer>

            <div class="button-container">
                <div class="options">
                    <v-btn text outlined class="top-menu" @click="jump('/')">
                        首页
                    </v-btn>
                    <v-btn text outlined class="top-menu" @click="jump('/mining')">
                        挖矿
                    </v-btn>
                    <v-btn text outlined class="top-menu" @click="jump('/marketPlace')">
                        市场
                    </v-btn>
                    <v-btn text outlined class="top-menu" @click="jump('/portfolio')">
                        库存
                    </v-btn>
                    <v-btn outlined class="top-menu build" @click="jump('/build')">
                        拼接
                    </v-btn>
                </div>


            </div>
            <w3m-button class="connect-wallet" />


        </v-app-bar>
    </div>
</template>

<script>
export default {
    name: 'TopBar',
    props: {

    },
    methods: {
        jump(r) {
            if (this.$route.path === r) {
                return
            }
            this.$router.push(r)
        }
    },
}
</script>

<style scoped>
.button-container {
    width: 875px;
    position: fixed;
    margin-left: 15%;
}

.options {
    position: absolute;
    left: 0;
    top: 50%;
    /* 以父容器顶部为基准向下偏移50% */
    transform: translateY(-50%);
    /* 向上偏移自身高度的一半 */
}

.top-menu {
    width: 100px;
    margin: 25px;
}

.build {
    /* margin-right: 150px; */
    color: #ff0000;
}
</style>
