<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-3 mt-3">
        <Header />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 mb-5">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
html, body {
  font-family: "Quicksand", sans-serif;
  font-weight: 500;
}
.lexend-mega {
  font-family: "Lexend Mega", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
</style>
