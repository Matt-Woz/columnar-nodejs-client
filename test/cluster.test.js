/*
 *  Copyright 2016-2024. Couchbase, Inc.
 *  All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

'use strict'

const assert = require('chai').assert
const H = require('./harness')

const { PassthroughDeserializer } = require('../lib/deserializers')

describe('#Cluster', function () {
  it('should correctly set timeouts', function () {
    let options = {
      timeoutOptions: {
        connectTimeout: 20000,
        dispatchTimeout: 40000,
        managementTimeout: 80000,
        queryTimeout: 80000,
        resolveTimeout: 30000,
      },
    }

    const cluster = H.lib.Cluster.createInstance(
      H.connStr,
      H.credentials,
      options
    )

    assert.equal(cluster.bootstrapTimeout, 20000)
    assert.equal(cluster.dispatchTimeout, 40000)
    assert.equal(cluster.managementTimeout, 80000)
    assert.equal(cluster.queryTimeout, 80000)
    assert.equal(cluster.resolveTimeout, 30000)
  })

  it('should raise error on negative connectTimeout', function () {
    let options = {
      timeoutOptions: {
        connectTimeout: -1,
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should raise error on negative dispatchTimeout', function () {
    let options = {
      timeoutOptions: {
        dispatchTimeout: -1,
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should raise error on negative managementTimeout', function () {
    let options = {
      timeoutOptions: {
        managementTimeout: -1,
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should raise error on negative queryTimeout', function () {
    let options = {
      timeoutOptions: {
        queryTimeout: -1,
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should raise error on negative resolveTimeout', function () {
    let options = {
      timeoutOptions: {
        resolveTimeout: -1,
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should raise error on negative socketConnectTimeout', function () {
    let options = {
      timeoutOptions: {
        socketConnectTimeout: -1,
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should correctly set security options', function () {
    let options = {
      securityOptions: {
        trustOnlyPlatform: true,
        verifyServerCertificates: false,
        cipherSuites: ['suite'],
      },
    }

    const cluster = H.lib.Cluster.createInstance(
      H.connStr,
      H.credentials,
      options
    )

    assert.isTrue(cluster._securityOptions.trustOnlyPlatform)
    assert.isFalse(cluster._securityOptions.verifyServerCertificates)
    assert.deepEqual(cluster._securityOptions.cipherSuites, ['suite'])
    assert.isUndefined(cluster._securityOptions.trustOnlyCapella)
    assert.isUndefined(cluster._securityOptions.trustOnlyPemFile)
    assert.isUndefined(cluster._securityOptions.trustOnlyCertificates)
    assert.isUndefined(cluster._securityOptions.trustOnlyPemString)
  })

  it('should default to trustOnlyCapella if no options are set', function () {
    const cluster = H.lib.Cluster.createInstance(H.connStr, H.credentials)

    assert.isTrue(cluster._securityOptions.trustOnlyCapella)
    assert.isUndefined(cluster._securityOptions.trustOnlyPemFile)
    assert.isUndefined(cluster._securityOptions.trustOnlyCertificates)
    assert.isUndefined(cluster._securityOptions.trustOnlyPemString)
    assert.isUndefined(cluster._securityOptions.trustOnlyPlatform)
    assert.isUndefined(cluster._securityOptions.verifyServerCertificates)
    assert.isUndefined(cluster._securityOptions.cipherSuites)
  })

  it('should throw an error if multiple trustOnly options are set', function () {
    let options = {
      securityOptions: {
        trustOnlyCapella: true,
        trustOnlyPemFile: 'pemFile',
      },
    }

    H.throwsHelper(() => {
      H.lib.Cluster.createInstance(H.connStr, H.credentials, options)
    }, Error)
  })

  it('should correctly set dns options', function () {
    let options = {
      dnsConfig: {
        nameserver: 'localhost',
        port: 12345,
        dnsSrvTimeout: 3000,
      },
    }

    const cluster = H.lib.Cluster.createInstance(
      H.connStr,
      H.credentials,
      options
    )

    assert.strictEqual(cluster._dnsConfig.nameserver, 'localhost')
    assert.strictEqual(cluster._dnsConfig.port, 12345)
    assert.strictEqual(cluster._dnsConfig.dnsSrvTimeout, 3000)
  })

  it('should correctly set cluster-level deserializer', function () {
    let options = {
      deserializer: new PassthroughDeserializer(),
    }

    const cluster = H.lib.Cluster.createInstance(
      H.connStr,
      H.credentials,
      options
    )
    assert.instanceOf(cluster.deserializer, PassthroughDeserializer)
  })

  it('should error ops after close and ignore superfluous closes', async function () {
    this.skip() // TODO: Query after cluster.close() hangs

    H.skipIfIntegrationDisabled()
    const cluster = H.lib.Cluster.createInstance(H.connStr, H.credentials)
    const scope = cluster.database(H.databaseName).scope(H.scopeName)

    await scope.executeQuery("SELECT 'Hello Earth!' AS message")

    await cluster.close()
    await cluster.close()
    await cluster.close()
    await cluster.close()

    await H.throwsHelper(async () => {
      await scope.executeQuery("SELECT 'Hello Mars!' AS message")
    }, Error)

    await cluster.close()
    await cluster.close()
  })
})
