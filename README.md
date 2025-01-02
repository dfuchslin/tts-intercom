# TTS Intercom

### Docker commands

#### Local
```shell
docker build --platform=linux/arm64 --progress=plain -t tts-intercom .
```

```shell
docker run --env-file=.env -p 3000:3000 tts-intercom
```

#### Create image in GHCR

A github workflow will run at each commit, branch, tag, create a new image, and upload to the GHCR. The version is
taken from the commit (hash, branchname, pr, tagname). If the tag is a semver then the image will also be set to
`latest`.

```shell
git tag v0.0.1
git push origin v0.0.1
```
