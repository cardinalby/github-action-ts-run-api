const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const impl = require('./githubServiceEnvImpl').run;

impl(github.context, fs, path);