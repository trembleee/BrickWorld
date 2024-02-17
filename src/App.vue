<template>
  <div id="app">
    <nav v-if="!$route.meta.hideNav">
      <router-link to="/">首页</router-link> |
      <router-link to="/mining">挖矿</router-link> |
      <router-link to="/marketPlace">市场</router-link> |
      <router-link id="buildButton" to="/build">拼接</router-link>|
      <router-link to="/portfolio">库存</router-link> |
      <button>连接钱包</button>
    </nav>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #0dcbe9;
}

#buildButton {
  border: 3px solid rgb(0, 0, 0);
  display: inline-block;
  text-decoration: none;
}
</style>
