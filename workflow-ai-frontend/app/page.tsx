// Este es un "Server Component" en Next.js.
// Se ejecuta en el servidor, NO en el navegador del usuario.
// Por eso podemos hacer 'async' y 'await' directamente.


import { Task } from "@/types";
import { CreateTaskForm } from "./createTaskForm";
import { TaskItem } from "./taskItem";

// 2. Función para obtener las tareas
async function getTasks(): Promise<Task[]> {
  try {
    // con fetch para HACER PETICIONES
    // 'cache: "no-store"' asegura que siempre pida datos frescos
    // (útil para desarrollo, como un --reload)
    const res = await fetch(`${process.env.API_URL}/tasks/`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('failed to get tasks');
    }

    return res.json();

  } catch (error) {
    console.error(error);
    return []; // Regresa un array vacío si hay un error
  }
}


// 3. El componente de la Página (¡ahora es 'async'!)
export default async function Home() {
  // 4. Llamamos a la función y esperamos los datos
  const tasks = await getTasks();

  // 5. Renderizamos el JSX (es como el HTML de Angular)
  return (
    <main className="container h-[100vh] mx-auto p-8 flex flex-col items-center justify-center">
      <article className="flex flex-col w-full items-center py-2 mb-4 gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="#035388" d="M13 2.03v2.02c4.39.54 7.5 4.53 6.96 8.92c-.46 3.64-3.32 6.53-6.96 6.96v2c5.5-.55 9.5-5.43 8.95-10.93c-.45-4.75-4.22-8.5-8.95-8.97m-2 .03c-1.95.19-3.81.94-5.33 2.2L7.1 5.74c1.12-.9 2.47-1.48 3.9-1.68zM4.26 5.67A9.9 9.9 0 0 0 2.05 11h2c.19-1.42.75-2.77 1.64-3.9zM15.5 8.5l-4.88 4.88l-2.12-2.12l-1.06 1.06l3.18 3.18l5.94-5.94zM2.06 13c.2 1.96.97 3.81 2.21 5.33l1.42-1.43A8 8 0 0 1 4.06 13zm5.04 5.37l-1.43 1.37A10 10 0 0 0 11 22v-2a8 8 0 0 1-3.9-1.63"/></svg>
        <h1 className="text-3xl font-bold">Crear una nueva tarea!</h1>
        <h3 className="text-sm text-gray-400">Rellena los siguientes datos para añadir una nueva tarea a la lista.</h3>
      </article>

      <CreateTaskForm />

      <div className="flex flex-col gap-4">
        {/* .map() para iterar (es el 'ngFor' de React)
          'key={task.id}' es obligatorio para que React
          identifique cada elemento de la lista.
        */}
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {/* Mensaje si no hay tareas */}
        {tasks.length === 0 && (
          <p className="text-gray-500">No hay tareas. Comenzemos!</p>
        )}
      </div>
    </main>
  );
}