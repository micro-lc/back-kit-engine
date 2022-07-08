#!/usr/bin/env node
'use strict'
import {main} from './start'

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
})
