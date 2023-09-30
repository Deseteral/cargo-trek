import { ActiveJob, GameState } from 'ludum-dare-54/game/game-state';
import { formattedCalendarTime, formattedDurationTime } from 'ludum-dare-54/game/world-time';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { Color, ENDESGA16PaletteIdx, GridView, Input, Scene, SceneManager, Screen, Vector2 } from 'ponczek';

interface MenuItem {
  aj: ActiveJob,
}

class ActiveJobsMenuGridView extends GridView<MenuItem> {
  constructor() {
    super(200, 12);
  }

  public drawCell(item: (MenuItem | null), _row: number, _column: number, x: number, y: number, isSelected: boolean, scr: Screen): void {
    if (!item) return;

    const job = item.aj.job;
    const color = isSelected ? ENDESGA16PaletteIdx[4] : Color.white;
    const text = `${job.targetCity.name}`;

    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

export class OverworldPauseScene extends Scene {
  activeJobsMenu: ActiveJobsMenuGridView;

  constructor() {
    super();
    this.activeJobsMenu = new ActiveJobsMenuGridView();
    this.activeJobsMenu.cells = GameState.activeJobs.map((aj) => ([{ aj }]));
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (GameState.activeJobs.length > 0) {
      if (Input.getKeyDown('KeyS')) {
        this.activeJobsMenu.selectNextRow(true);
      }
      if (Input.getKeyDown('KeyW')) {
        this.activeJobsMenu.selectPreviousRow(true);
      }

      if (Input.getKeyDown('Enter')) {
        const aj = this.activeJobsMenu.selectedValue.aj;
        const timeDiff = aj.completeUntilTime - GameState.time;
        const text = [
          aj.job.targetCity.name,
          `Payment: $${aj.job.price}`,
          '',
          timeDiff <= 0 ? 'Delayed shipment' : `Time left: ${formattedDurationTime(timeDiff)}`,
        ].join('\n');
        SceneManager.pushScene(new DialogBoxScene(text));
      }
    }
  }

  render(scr: Screen): void {
    scr.color(ENDESGA16PaletteIdx[3]);
    scr.fillRect(0, 0, 200, scr.height);
    scr.drawText(formattedCalendarTime(), 1, 1, Color.white);
    scr.drawText(`$${GameState.cash}`, 1, 11, Color.white);

    scr.drawText('Active jobs', 1, 28, Color.white);

    if (GameState.activeJobs.length > 0) {
      this.activeJobsMenu.drawAt(new Vector2(5, 38), scr);
    } else {
      scr.drawText('Currently you have no\njobs active', 5, 38, Color.white);
    }
  }
}
