import { City } from 'ludum-dare-54/game/world-map';
import { ENDESGA16PaletteIdx, Input, Random, Scene, SceneManager, Screen } from 'ponczek';

export class TalkScene extends Scene {
  text: string;

  constructor(city: City) {
    super();

    const welcome: string[] = [
      'Hey there, stranger!',
      'Hello!',
      'Hey!',
      'Good morning!',
      'Hello there!',
      'Morning!',
      'Howdy!',
      'Good to see you!',
      'Ahoy!',
      'Hello stranger!',
      'You must be the one from Cargo Trek, right?',
      'Good day to you!',
      "It's like Christmas morning when we see a Cargo Trek truck.",
    ];

    const starter: string[] = [
      'How are you?',
      "It's so cold today.",
      "Beautiful day, isn't it?",
      "It looks like it's going to snow.",
      "We couldn't ask for a nicer day, could we?",
      'Looking forward to the weekend?',
      'Autumn is so beautiful, isn\'t it?.',
    ];

    const conversation: string[] = [
      "We were running low on supplies, and your arrival couldn't have been more timely.",
      "You must have stories to tell from all your trips. Swing by the diner when you're done, and we'll chat over a cup of coffee.",
      "We're ready to roll up our sleeves and help with the unloading.",
      `We're a tight-knit bunch up here in ${city.name}.`,
      'Life is simple and peaceful here.',
      "Your deliveries keep our gardens blooming, and now we look forward to gathering at the local cafe to share stories after a hard day's work.",
      `${city.name}'s all about community, and you're a part of it now.`,
      "We might invite you to join our annual fishing competition by the river - it's a friendly tradition.",
      'You might spot some of us birdwatching during the weekends',
      'We like to gather at the local park for picnics and music. Your deliveries ensure those gatherings are well-stocked.',
      `In ${city.name}, we embrace the snow and cold. We're known for our winter festivals`,
    ];

    const thanks: string[] = [
      "You're a real lifeline for our little community.",
      `Thanks for bringing us what we need up here in ${city.name}.`,
      `We can't thank you enough for making the trek up here to ${city.name}.`,
      "You're a true hero!",
      'Thanks for being our lifeline.',
      `You bring joy to ${city.name}, my friend.`,
      'Your deliveries help keep our community thriving, and we sure do appreciate it.',
    ];

    const r = Random.default;
    this.text = [
      r.pickOne(welcome),
      '\n',
      r.nextBoolean() ? r.pickOne(starter) : null,
      '\n',
      r.pickMany(conversation, r.nextInt(1, 2), false).join(' '),
      '\n',
      r.pickOne(thanks),
    ].filter((s) => s !== null).join('');
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16PaletteIdx[3]);
    scr.drawTextInRect(this.text, 2, 4, scr.width - 4, scr.height - 4, ENDESGA16PaletteIdx[1]);
  }
}
