const { configDotenv, config } = require('dotenv')
const User = require('./src/entities/User')
const PostgreUserRepository = require('./src/repositories/PostgreUserRepository')
const bcrypt = require('bcrypt')

config()

const main = async () => {

    const users = []

    for (let i = 0; i < 2000; i++) {
        passwordHash = bcrypt.hashSync(`password${i}`, 10)
        address = ['Rua de baixo nº21',
            'Rua Norton de Matos nº4',
            'Rua S. Miguel nº12',
            'Rua das Laranjeiras nº 5',
            'Rua do Campo nº 27',
            'Rua de São Mamede nº 11',
            'Rua das Naus nº 43',
            'Rua de São João nº 29',
            'Rua do Arsenal nº 17',
            'Rua das Flores nº 31',
            'Rua das Pedras nº 19',
            'Rua das Laranjeiras nº 5',
            'Rua do Campo nº 27',
            'Rua de São Mamede nº 11',
            'Rua das Naus nº 43',
            'Rua de São João nº 29',
            'Rua do Arsenal nº 17',
            'Rua das Flores nº 31',
            'Rua das Pedras nº 19',
            'Rua das Laranjeiras nº 5',
            'Rua do Campo nº 27',
            'Rua de São Mamede nº 11'
        ]
        names = ['João Costa', 'Maria Manuela', 'Mário Dantas', 'Antônio Costa', 'Catarina Almeida', 'João Almeida', 'Mário Costa', 'Antônio Almeida', 'Catarina Costa', 'Mário Costa']
        city = ['Braga', 'Lisboa', 'Porto', 'Barcelos', 'Faro', 'Coimbra', 'Funchal', 'Évora', 'Aveiro', 'Guimarães']
        postalcode = ['4000-123', '4050-202', '4100-009', '4150-669', '4200-256', '4300-307', '4350-109', '4400-129', '4450-589', '4500-673']
        mobilephone = ['912345678', '962345678', '922345678', '932345678', '932456789', '912345987', '962378945', '922345671', '932345672',
            '912345653', '962345654', '922345655', '932345656', '912345657', '962345658', '922345659', '932345660', '912345661', '962345662']
        const user = new User({
            id: i,
            username: `user${i}`,
            name: names[Math.floor(Math.random() * names.length)],
            email: `email${i}@allcarsinone.pt`,
            password: passwordHash,
            address: address[Math.floor(Math.random() * address.length)],
            city: city[Math.floor(Math.random() * city.length)],
            postalcode: postalcode[Math.floor(Math.random() * postalcode.length)],
            mobilephone: mobilephone[Math.floor(Math.random() * mobilephone.length)],
            photo: ``,
            role_id: Math.floor(Math.random() * 3 + 1)
        })
        console.log(user)
        users.push(user)
    }

    const userRepository = new PostgreUserRepository("postgres://dss:dss@localhost:5432/users")
    for (let i = 0; i < users.length; i++) {
        await userRepository.create(users[i])
    }

}

main()