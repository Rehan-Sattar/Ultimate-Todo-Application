import { Observable } from 'rxjs';
import swal from "sweetalert";
import { Actions } from "./Actions";
const API_END_POINT = 'http://localhost:2000';
function insertTodoToDatabase(todoState) {
    return dispatch => {
        const inserTodoObserver$ = Observable.create(obs => {
            fetch(`http://localhost:2000/todo/api/v1.0/tasks/add`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: todoState.title,
                    description: todoState.description
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status) {
                        fetch(`${API_END_POINT}/todo/api/v1.0/tasks`)
                            .then(res => res.json())
                            .then(data => {
                                obs.next(data);
                                obs.complete();
                            })
                            .catch(err => obs.error(err))
                    }
                })
                .catch(err => obs.error(err))
        })
        inserTodoObserver$.subscribe(data => {
            swal('Todo added', "Todo has been added!", 'success');
            dispatch({
                type: Actions.readAllTodoSuccess,
                payload: data
            })
        })
    };
};



function deleterTodoFromDatabase(todoId) {
    return dispatch => {

        console.log(todoId);
        const deteTodoObservable$ = Observable.create(obserber => {
            fetch(`${API_END_POINT}/todo/api/v1.0/tasks/delete/${todoId}`, {
                method: "delete",

            })
                .then(res => res.json())
                .then(data => {
                    fetch(`${API_END_POINT}/todo/api/v1.0/tasks`)
                        .then(res => res.json())
                        .then(data => {
                            obserber.next(data);
                            obserber.complete();

                        })
                        .catch(err => obserber.error(err))
                })
                .catch(err => obserber.error(err))

        });

        deteTodoObservable$.subscribe(data => {
            swal('Todo Deleted', "Todo has been Deleted!", 'success');
            dispatch({
                type: Actions.readAllTodoSuccess,
                payload: data
            });
        });
    };
};

function updateTodoInDatabase({ updateDescription,
    updateTitle,
    updateDoneStatus,
    todoId
}) {
    return dispatch => {

        const updateTodoObservable$ = Observable.create(observer$ => {
            fetch(`${API_END_POINT}/todo/api/v1.0/tasks/edit/${todoId}`, {
                method: 'put',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: updateTitle,
                    description: updateDescription
                })

            })
                .then(res => res.json())
                .then(data => {
                    fetch(`${API_END_POINT}/todo/api/v1.0/tasks`)
                        .then(res => res.json())
                        .then(data => {
                            observer$.next(data);
                            observer$.complete();

                        })
                        .catch(err => observer$.error(err))
                })
                .catch(err => observer$.error(err))
        });

        updateTodoObservable$.subscribe(data => {
            swal('Todo updated', "Todo has been updated!", 'success');
            dispatch({
                type: Actions.readAllTodoSuccess,
                payload: data
            })
        })

    }
};

function getAllTodosFromDatabase() {
    return dispatch => {
        const getDataFromDatabase$ = Observable.create(observer$ => {
            fetch('https://nodejs-todo-server.herokuapp.com/todo/api/v1.0/tasks/')
                .then(response => response.json())
                .then(data => {
                    observer$.next(data);
                    observer$.complete();
                })
                .catch(err => observer$.error(err));
        });

        getDataFromDatabase$.subscribe(data => dispatch({
            type: 'ALL_TODOS',
            payload: data
        }));
    }
}

function taskDoneAttempt(todo, status) {
    return dispatch => {
        const taskDoneObservable$ = Observable.create(observer$ => {
            fetch(`${API_END_POINT}/todo/api/v1.0/todos/done/${todo}`, {
                method: "put",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    done: status
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data[0]) {
                        observer$.next(data[0]);
                        observer$.complete();
                    }
                })
                .catch(err => {
                    observer$.error(err);
                });
        });

        taskDoneObservable$.subscribe(data => {
            swal('status updated', 'Your status has been updated', 'success');
            dispatch({
                type: Actions.updateTodoSuccess,
                payload: data[0]
            });
        }, err => dispatch({
            type: Actions.taskDoneError,
            err
        })
        )
    };
};



export {
    insertTodoToDatabase,
    deleterTodoFromDatabase,
    updateTodoInDatabase,
    getAllTodosFromDatabase,
    taskDoneAttempt
};
