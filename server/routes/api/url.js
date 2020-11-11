const express = require('express')
const mysql = require('mysql')
const yup = require('yup')
const { nanoid } = require('nanoid');

require('dotenv').config();

const router = express.Router()

let config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB
}

// Get URLs
router.get('/urls', async (req, res) => {
  let result = await getURLS()
  res.send(await result)
})

// Get URL ONLY
router.get('/url', async (req, res) => {
  let { slug } = {
    slug: req.query.slug
  }
  // console.log(slug)
  let result = await getURL(slug)
  res.send(await result)
})

// Generate URL
router.post('/create', async (req, res) => {
  // let { url, slug } = req.body
  let { url, slug } = {
    url: req.body.url,
    slug: req.body.slug
  }
  let result = await createURL(url, slug)
  // console.log('route/create: ')
  // console.log(result)
  res.status(201).send(await result)
})

// Update URL clicks
// router.put('/clicks', async (req, res) => {
//   // let { url, slug } = req.body
//   let { url, slug } = {
//     url: req.body.url,
//     slug: req.body.slug
//   }
//   let result = await updateURL(url, slug)
//   // console.log('route/create: ')
//   // console.log(result)
//   res.status(201).send(await result)
// })

const schema = yup.object().shape({
  url: yup.string().trim().url('Enter a valid URL').required('Enter a URL'),
  slug: yup.string().trim().matches(/^[\w\-]+$/i)
});

async function createURL(url, slug) {
  return new Promise (async (resolve, reject) => {
    let connection = mysql.createConnection(config)
    let result = {
      status: false
    }
    
    try {
      await schema.validate({
        url,
        slug,
      })
      connection.connect((err) => {
        if(err) {
          result.error = {
            code: err.code,
            message: err.message
          }
          result.status = false
          resolve(result)
          return
        } else {

          if (url.includes('tinyy.link')) {
            result.error = {
              code: 420.69,
              message: `Using tinyy.link as a URL is forbidden. Stop tryna be sneaky! ❌❌❌`
            }
            result.status = false
            resolve(result)
            return
          }
          if (!slug) {
            slug = nanoid(5);
            slug = slug.toUpperCase()
          } else {
            let query = `SELECT * FROM urls WHERE slug = '${slug}'`
            connection.query(query, function (error, results, fields) {
              if(error) throw error
              if(results.length > 0) {
                result.error = {
                  code: 802.42,
                  message: `Slug is in use. Assign a different slug. 🐌`
                }
                result.status = false
                resolve(result)
              } else {
                let code = nanoid(6);
                code = code.toUpperCase()
                let query = `INSERT INTO urls SET ?`
                connection.query(query, {URL: url, Slug: slug, Code: code} , function (error, results, fields) {
                  if(error) throw error
                  let res = {
                    status: true,
                    data: {
                      "link": `https://tinyy.link/${slug}`,
                      "url": url,
                      "slug": slug,
                      "code": code,
                      "id": results.insertId
                    }
                  }
                  resolve(res)
                })
              }
            })
          }
        }
      })
    } catch (err) {
      result.error = {
        code: err.code,
        message: err.message
      }
      result.status = false
      // console.log(err)
      resolve(result)
    }
  })
}

// Get URL
async function getURL(slug) {
  return new Promise (async (resolve, reject) => {
    let connection = mysql.createConnection(config)
    let result = {
      status: false
    }
    try {
      connection.connect((err) => {
        if(err) {
          result.error = {
            code: err.code,
            message: err.message
          }
          result.status = false
          resolve(result)
        } else {
          let query = `SELECT * FROM urls WHERE Slug = '${slug}'`
          let query_result = []
          connection.query(query, function (error, results, fields) {
            if(error) throw error
            if(results.length > 0) {
              for (result in results) {
                query_result.push(results[result])
              }
              let res = JSON.parse(JSON.stringify(query_result))
              resolve(res)
            } else {
              result.error = {
                status: false,
                message: 'Slug not found'
              }
              // console.log('Slug not found')
              resolve(result)
            }
          })
        }
      })
    } catch (err) {
      result.error = {
        code: err.code,
        message: err.message
      }
      result.status = false
      resolve(result)
      // resolve(result)
    }
  })
}

// Get URLs
async function getURLS() {
  return new Promise (async (resolve, reject) => {
    let connection = mysql.createConnection(config)
    let result = {
      status: false
    }
    try {
      connection.connect((err) => {
        if(err) {
          result.error = {
            code: err.code,
            message: err.message
          }
          result.status = false
          resolve(result)
        } else {
          let query = `SELECT * FROM urls`
          let query_result = []
          connection.query(query, function (error, results, fields) {
            if(error) throw error
            if(results.length > 0) {
              for (result in results) {
                query_result.push(results[result])
              }
              let res = JSON.parse(JSON.stringify(query_result))
              resolve(res)
            }
          })
        }
      })
    } catch (err) {
      result.error = {
        code: err.code,
        message: err.message
      }
      result.status = false
      resolve(result)
      // resolve(result)
    } finally {
      // if( connection && connection.end ) connection.end()
      // return result.status;
    }
  })
}

module.exports = router