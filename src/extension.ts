import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    context.subscriptions.push(statusBarItem);

    /*const workDuration = 25*60;
    const shortBreakDuration = 5*60;
    const longBreakDuration = 30*60;*/
    const workDuration = 2;
    const shortBreakDuration = 1;
    const longBreakDuration = 3;

    let remainingTime = workDuration;
    let timer: NodeJS.Timeout | undefined;
    let isPaused = false;
    let cycleCount = 0;
    let inBreak = false;
    let longBreakMode = false;
    let completedWorkSessions = 0;

    function updateStatusBar() {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const modeText = inBreak ? (longBreakMode ? 'Длинный перерыв' : 'Перерыв'): 'Работа';
        const pauseText = isPaused ? 'Продолжить' : 'Пауза';

        statusBarItem.text = `$(clock) ${modeText}: ${minutes}m ${seconds}s [${pauseText}]`;
        statusBarItem.tooltip = 'Нажмите для паузы/возобновления';
        statusBarItem.command = 'pomodoro.togglePause';
        statusBarItem.show();
    }

    function startTimer() {
        if (timer) {
            clearInterval(timer);
        }

        if (remainingTime <= 0) {
            if (inBreak) {
                if (longBreakMode) {
                    cycleCount = 0;
                } else {
                    cycleCount++;
                }
                inBreak = false;
                remainingTime = workDuration;
            } else {
                completedWorkSessions++;
                inBreak = true;
                if (cycleCount >= 3) {
                    longBreakMode = true;
                    remainingTime = longBreakDuration;
                } else {
                    longBreakMode = false;
                    remainingTime = shortBreakDuration;
                }
            }
        }

        isPaused = false;
        updateStatusBar();

        timer = setInterval(() => {
            if (!isPaused) {
                remainingTime--;
                if (remainingTime <= 0) {
                    clearInterval(timer!);
                    startTimer();
                } else {
                    updateStatusBar();
                }
            }
        }, 1000);
    }

    function togglePause() {
        isPaused = !isPaused;
        updateStatusBar();
    }

    const startCommand = vscode.commands.registerCommand('pomodoro.startPomodoro', () => {
        cycleCount = 0;
        inBreak = false;
        longBreakMode = false;
        remainingTime = workDuration;
        completedWorkSessions = 0;
        vscode.window.showInformationMessage('Запущено расширение Pomodoro');
        startTimer();
    });

    const pauseCommand = vscode.commands.registerCommand('pomodoro.togglePause', togglePause);
    context.subscriptions.push(startCommand, pauseCommand);

	const deactivateCommand = vscode.commands.registerCommand('pomodoro.deactivatePomodoro', () => {
		if (timer) {
			clearInterval(timer);
		}
		statusBarItem.hide();
		vscode.window.showInformationMessage(`Совершен выход из расширения Pomodoro. Рабочих сессий: ${completedWorkSessions}`);
	});
	context.subscriptions.push(deactivateCommand);
}

export function deactivate() {}
