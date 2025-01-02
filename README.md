# TTS Intercom

### Docker commands

#### Local
```shell
docker build --progress=plain -t tts-intercom .
```

```shell
docker run --env-file=.env -p 3000:3000 tts-intercom
```

```shell
docker run --platform=linux/amd64 --env-file=.env -p 3000:3000 ghcr.io/dfuchslin/tts-intercom:latest
```

#### Create image in GHCR

A github workflow will run at each commit, branch, tag, create a new image, and upload to the GHCR. The version is
taken from the commit (hash, branchname, pr, tagname). If the tag is a semver then the image will also be set to
`latest`. Currently, the image is only built for `linux/amd64`.

```shell
git tag v0.0.1
git push origin v0.0.1
```
