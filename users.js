app.get('/users', (req, res) => {
  if(!req.session.user)
    return res.redirect('/?message=unauthorized')
  res.locals.user = req.session.user
  async.series([
    callback => {
      Cosmic.getObjectType({ bucket: { slug: config.COSMIC_BUCKET } }, { type_slug: 'users' }, (err, response) => {
        res.locals.users = response.objects.all
        callback()
      })
    },
    callback => {
      Cosmic.getObjects({ bucket: { slug: config.COSMIC_BUCKET } }, (err, response) => {
        res.locals.cosmic = response
        return res.render('users.html', {
          partials
        })
      })
    }
  ])
})
