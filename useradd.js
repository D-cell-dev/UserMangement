app.post('/users', (req, res) => {
  const data = req.body
  async.series([
    callback => {
      let user_found = false
      Cosmic.getObjectType({ bucket: { slug: config.COSMIC_BUCKET } }, { type_slug: 'users' }, (err, response) => {
        _.forEach(response.objects.all, user => {
          if (_.find(user.metafields, { key: 'email', value: data.email.trim() }))
            user_found = true
        })
        if (!user_found)
          return callback()
        // User found
        return res.status(409).json({ status: 'error', message: 'Email already in use' })
      })
    },
    callback => {
      bcrypt.hash(data.password, saltRounds, function(err, hash) {
        res.locals.hash = hash
        callback()
      })
    },
    callback => {
      // Send to Cosmic
      const object = {
        type_slug: 'users',
        title: data.full_name,
        metafields: [
          {
            title: 'First name',
            key: 'first_name',
            type: 'text',
            value: data.first_name
          },
          {
            title: 'Last name',
            key: 'last_name',
            type: 'text',
            value: data.last_name
          },
          {
            title: 'Password',
            key: 'password',
            type: 'text',
            value: res.locals.hash
          },
          {
            title: 'Email',
            key: 'email',
            type: 'text',
            value: data.email.trim().toLowerCase()
          }
        ]
      }
      if (config.COSMIC_WRITE_KEY)
        object.write_key = config.COSMIC_WRITE_KEY
      Cosmic.addObject({ bucket: { slug: config.COSMIC_BUCKET } }, object, (err, response) => {
        if (err)
          res.status(500).json({ status: 'error', data: response })
        else
          res.json({ status: 'success', data: response })
        res.end()
      })
    }
  ])
})
