# hisaac.net

This is an empty branch meant to serve as the default branch for my fork so that `main`/`master` always points to the original repo's default branch.

Here is a gist containing the `fish` function I use to accomplish this: [`git-orphan.fish`](https://gist.github.com/hisaac/eb935a923e4656629d19b71725089467)

After the script runs:

1. Push the new branch up to your fork
1. In GitHub's web UI, set your fork's default branch to this newly created `default` branch
- Tip: You can do this with the `gh` cli like so:
```sh
gh api --method PATCH -H Accept:
application/vnd.github+json /repos/<org_name>/<repo_name> -f default_branch=default
```
1. Delete the `main`/`master` branch from your fork
