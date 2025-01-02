# TTS Intercom

### Docker commands

```shell
docker build --platform=linux/arm64 --progress=plain -t tts-intercom .
```

```shell
docker run --env-file=.env -p 3000:3000 tts-intercom
```
