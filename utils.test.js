const utils = require('./utils')

describe('getConfig', () => {
    
    test('throw error if value is missing', () => {
        expect(() => {
            utils.getConfig()
        }).toThrow()
    })
    
    test('returns ', () => {
        process.env['INPUT_OWNER'] = 'bots-house'
        process.env['INPUT_NAME'] = 'ghcr-delete-image'
        process.env['INPUT_TOKEN'] = 'some-token'
        process.env['INPUT_TAG'] = 'latest'
    
        expect(utils.getConfig()).toStrictEqual({
            owner: 'bots-house',
            name: 'ghcr-delete-image',
            token: 'some-token',
            tag: 'latest'
        })
    })
})


