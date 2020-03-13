#!/bin/bash
wget https://github.com/vitiral/artifact/releases/download/v2.1.5/artifact-v2.1.5-x86_64-unknown-linux-gnu.tar.gz
tar -xf artifact-v2.1.5-x86_64-unknown-linux-gnu.tar.gz
./art export html art_published
