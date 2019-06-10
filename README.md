<div align="center">
<h1>Coc-Homeassistant</h1>
<div style="display: flex; justify-content: center;">
  <a style="margin-right: 0.5rem;" href="https://circleci.com/gh/danielwelch/coc-homeassistant">
    <img src="https://circleci.com/gh/danielwelch/coc-homeassistant.svg?style=svg">
  </a>
  <a style="margin-left: 0.5rem;" href="https://www.npmjs.com/package/coc-homeassistant">
    <img src="https://img.shields.io/npm/dw/coc-homeassistant.svg?logo=npm&style=flat-square">
  </a>
</div>
<br>
<p>Coc.nvim extension for Home Assistant Config Helper</p>
</div>

## Installation and Initialization
`:CocInstall coc-homeassistant`

The extension will start automatically for buffers with filetype `home-assistant`.

## Configuration
Add the following settings to your coc-settings.json (`:CocConfig`):

- `homeassistant.enable`: Enable the Home Assistant Extension. Defaults to `true`.
- `homeassistant.hostUrl`: The Host URL of your Home Assistant instance. Only protocol, host, and port (no path or querystring). Defaults to `http://hassio.local`
- `homeassistant.longLivedAccessToken`: The Long Lived Access-Token for Home Assistant. Obtain a token via your user profile page in Home Assitant.
- `homeassistant.ignoreCertificates`: Enable insecure transport. Check this if you want to connect over an insecure HTTPS transport with an invalid certificate. Defaults to `false`
