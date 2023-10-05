# Cargo Trek

> Welcome to Cargo Trek!
>
> We're excited to have you on board as a truck driver here in Arcadian Valley.
>
> Your role is essential in delivering goods to our local communities. Your job makes a difference!"

You're a new hire at local delivery company "Cargo Trek" where you will be a truck driver delivering goods to communities living in small towns.

Manage your truck and cargo, discover procedurally generated map and complete delivery jobs from nearby towns.

![Cover image](promo_assets/itch_cover.png?raw=true "Cover image")

My game for [Ludum Dare 54](https://ldjam.com/events/ludum-dare/54/cargo-trek).
You can play it on [my itch.io page](https://deseteral.itch.io/cargo-trek).

Made using my custom framework [ponczek](https://github.com/Deseteral/ponczek).

## Building
Install dependencies:
```sh
git submodule update --init --recursive
cd ./ponczek
yarn install
cd ..
yarn install
```

Development build with watch mode:
```sh
yarn dev
```

Production build:
```sh
yarn build
```

## License
This project is licensed under the [MIT license](LICENSE).
