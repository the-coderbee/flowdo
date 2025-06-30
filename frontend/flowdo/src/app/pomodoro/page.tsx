// 'use client';

// import { useState } from 'react';
// import { sampleTasks, Task } from '@/lib/task';
// import { PomodoroController } from '@/components/pomodoro';
// import { useSearchParams } from 'next/navigation';

// export default function PomodoroPage() {
//   const [tasks, setTasks] = useState<Task[]>(sampleTasks);
//   const searchParams = useSearchParams();
//   const taskId = searchParams.get('taskId');
  
//   const handleCompletePomodoro = (taskId: string) => {
//     setTasks(prevTasks => 
//       prevTasks.map(task => {
//         if (task.id === taskId) {
//           // Don't exceed the estimated count
//           const newCount = Math.min(
//             task.completedPomodoros + 1, 
//             task.estimatedPomodoros
//           );
          
//           return {
//             ...task,
//             completedPomodoros: newCount
//           };
//         }
//         return task;
//       })
//     );
//   };
  
//   return (
//     <div className="container p-4 md:p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-center">Pomodoro Timer</h1>
//       </div>
      
//       <PomodoroController 
//         tasks={tasks}
//         onCompletePomodoro={handleCompletePomodoro}
//       />
//     </div>
//   );
// } 