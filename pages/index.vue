<script setup lang="ts">
import NavBar from "../components/NavBar.vue";
import Header from "../components/Header.vue";
import { lightTheme } from "naive-ui";
import ServerList from "../components/ServerList/ServerList.vue";
import "../assets/css/index.less";
</script>

<template>
  <n-config-provider :theme="lightTheme">
    <div class="layout">
      <header class="header">
        <Header />
      </header>
      <div class="content">
        <aside class="sidebar">
          <NavBar />
        </aside>
        <main class="main-content">
          <ServerList />
        </main>
      </div>
    </div>
  </n-config-provider>
</template>

<style scoped lang="less">
@primary-color: #fff;
@header-height: 60px;
@sidebar-width: 280px;
@padding-size: 1rem;
@border-color: #ddd;

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: @primary-color;
    height: @header-height;
    box-sizing: border-box;
    padding: @padding-size;
    border-bottom: 1px solid @border-color;
    z-index: 100;
  }

  .content {
    display: flex;
    flex-grow: 1;
    background-color: @primary-color;
    margin-top: @header-height;

    .sidebar {
      position: fixed;
      left: 0;
      box-sizing: border-box;
      width: @sidebar-width;
      padding: @padding-size;
      padding-top: 0;
      padding-right: 0;
      height: calc(100vh - @header-height);
      border-right: 1px solid @border-color;
      z-index: 100;
      transition: 0.3s all;

      @media screen and (max-width: 1200px) {
        transform: translateX(-@sidebar-width);
      }
    }

    .main-content {
      margin-left: @sidebar-width;
      width: 100%;
      box-sizing: border-box;
      max-height: 100%;
      padding: @padding-size;
      padding-top: 0;
      transition: 0.3s all;
      @media screen and (max-width: 1200px) {
        margin-left: 0;
      }
    }
  }
}
</style>
