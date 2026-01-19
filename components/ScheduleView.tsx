
import React, { useState, useEffect, useCallback } from 'react';
import { ScheduledTask, TaskPriority } from '../../types.ts';
import { TrashIcon } from './Icons';
import EmptyState from './EmptyState';
import { ScheduleIllustration } from './Illustrations';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, PermissionStatus } from '@capacitor/local-notifications';

interface ScheduleViewProps {
  tasks: ScheduledTask[];
  onUpdateTask: (task: ScheduledTask) => void;
  onDeleteTask: (taskId: string) => void;
}

const priorityClasses: { [key in TaskPriority]: { text: string; border: string } } = {
    [TaskPriority.High]: { text: 'text-red-600 dark:text-red-400', border: 'border-red-500' },
    [TaskPriority.Medium]: { text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500' },
    [TaskPriority.Low]: { text: 'text-green-600 dark:text-green-400', border: 'border-green-500' },
};

const getTaskStatus = (task: ScheduledTask): { text: string; color: string } => {
    if (task.isComplete) {
        return { text: 'Concluída', color: 'text-gray-400 dark:text-gray-500' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset()); // Adjust for timezone
    
    if (dueDate < today) {
        return { text: 'Atrasada', color: 'text-red-500 font-bold' };
    }
    if (dueDate.getTime() === today.getTime()) {
        return { text: 'Para hoje', color: 'text-yellow-500 font-bold' };
    }
    return { text: dueDate.toLocaleDateString('pt-BR'), color: 'text-gray-500 dark:text-gray-400' };
};

const ScheduleView: React.FC<ScheduleViewProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {
    const [notificationPermission, setNotificationPermission] = useState<PermissionState | 'prompt' | 'prompt-with-rationale'>('prompt');
    
    const scheduleNotifications = useCallback(async (tasksToSchedule: ScheduledTask[]) => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const permission = await LocalNotifications.checkPermissions();
            if (permission.display !== 'granted') return;

            // Cancel all existing notifications to avoid duplicates when rescheduling
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({ notifications: pending.notifications });
            }

            const notifications = tasksToSchedule
                .filter(task => !task.isComplete && new Date(task.dueDate) >= new Date())
                .map(task => ({
                    id: parseInt(task.id.slice(-8), 10), // Create a unique numeric ID from timestamp
                    title: `Lembrete de Tarefa: ${task.title}`,
                    body: task.description || `Sua tarefa "${task.title}" está agendada para hoje.`,
                    schedule: { at: new Date(task.dueDate) },
                    sound: undefined,
                    smallIcon: 'res://mipmap-hdpi/ic_launcher',
                    iconColor: '#3b82f6'
                }));

            if (notifications.length > 0) {
                await LocalNotifications.schedule({ notifications });
            }
        } catch (e) {
            console.error('Error scheduling notifications', e);
        }
    }, []);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            LocalNotifications.checkPermissions().then((status: PermissionStatus) => {
                setNotificationPermission(status.display);
            });
        }
    }, []);

    useEffect(() => {
        if (notificationPermission === 'granted') {
            scheduleNotifications(tasks);
        }
    }, [tasks, notificationPermission, scheduleNotifications]);

    const handleRequestNotificationPermission = async () => {
        if (Capacitor.isNativePlatform()) {
            const { display } = await LocalNotifications.requestPermissions();
            setNotificationPermission(display);
            if (display === 'granted') {
                scheduleNotifications(tasks);
            }
        }
    };
    
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const handleToggleComplete = (task: ScheduledTask) => {
        onUpdateTask({ ...task, isComplete: !task.isComplete });
    };

  return (
    <>
        {Capacitor.isNativePlatform() && notificationPermission !== 'granted' && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm shadow-sm ${
                notificationPermission === 'denied' 
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                    : 'bg-primary-100 dark:bg-primary-900/50 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200 flex justify-between items-center'
            }`}>
                {notificationPermission === 'denied' ? (
                     <p>As notificações estão bloqueadas. Para ativá-las, verifique as configurações do seu dispositivo.</p>
                ) : (
                    <>
                        <p>Deseja receber lembretes de tarefas?</p>
                        <button onClick={handleRequestNotificationPermission} className="font-semibold hover:underline flex-shrink-0 ml-4">Ativar notificações</button>
                    </>
                )}
            </div>
        )}

        {tasks.length === 0 ? (
            <EmptyState
                illustration={<ScheduleIllustration className="w-40 h-40" />}
                title="Nenhuma tarefa agendada"
                message="Mantenha tudo organizado adicionando suas tarefas de manutenção aqui."
              />
        ) : (
        <ul className="space-y-3">
        {sortedTasks.map(task => {
            const classes = priorityClasses[task.priority];
            const status = getTaskStatus(task);
            return (
            <li 
                key={task.id} 
                className={`p-3 rounded-2xl shadow-sm transition-all duration-300 bg-gray-100 dark:bg-slate-800 border-l-4 ${classes.border} ${task.isComplete ? 'opacity-60' : ''}`}
            >
                <div className="flex items-start">
                <input
                    type="checkbox"
                    checked={task.isComplete}
                    onChange={() => handleToggleComplete(task)}
                    className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 cursor-pointer mt-1 flex-shrink-0 bg-transparent dark:bg-slate-700"
                />
                <div className="flex-grow ml-3 min-w-0">
                    <p className={`font-semibold text-gray-800 dark:text-gray-200 ${task.isComplete ? 'line-through' : ''}`}>{task.title}</p>
                    {task.description && <p className={`text-sm text-gray-600 dark:text-gray-400 ${task.isComplete ? 'line-through' : ''}`}>{task.description}</p>}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 ${classes.text}`}>{task.priority}</span>
                    <span className={`text-xs font-medium ${status.color}`}>{status.text}</span>
                    </div>
                </div>
                <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/50 flex-shrink-0 ml-2"
                    aria-label="Excluir Tarefa"
                >
                    <TrashIcon />
                </button>
                </div>
            </li>
            );
        })}
        </ul>
        )}
    </>
  );
};

export default ScheduleView;
