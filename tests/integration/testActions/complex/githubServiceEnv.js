const github = require("@actions/github");
const fs = require("fs-extra");
const path = require("path");
const impl = require('./githubServiceEnvImpl').run;

impl(github, fs, path);