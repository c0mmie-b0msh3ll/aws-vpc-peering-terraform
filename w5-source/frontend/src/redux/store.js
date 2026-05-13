import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './activeBoard/activeBoardSlice'
import { userReducer } from './user/userSlice'
import { activeCardReducer } from './activeCard/activeCardSlice'
import { notificationsReducer } from './notifications/notificationSlice'
import { workspacesReducer } from './workspace/workspacesSlice'
import { aiReducer } from './ai/aiSlice'
import { combineReducers } from 'redux' // lưu ý chúng ta có sẵn redux trong node_modules bởi vì khi cài @reduxjs/toolkit là đã có luôn
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // default là localstorage

// Cấu hình persist
const rootPersistConfig = {
  key: 'root', // key của cái persist do chúng ta chỉ định, cứ để mặc định là root
  storage: storage, // Biến storage ở trên - lưu vào localstorage
  whitelist: ['user'] // định nghĩa các slice dữ liệu ĐƯỢC PHÉP duy trì qua mỗi lần f5 trình duyệt
  // blacklist: ['user'] // định nghĩa các slice KHÔNG ĐƯỢC PHÉP duy trì qua mỗi lần f5 trình duyệt
}

// combine các reduce trong dự án
const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer,
  notifications: notificationsReducer,
  workspaces: workspacesReducer,
  ai: aiReducer
})

// thực hiện việc persist reducer
const persistedReducers = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducers,
  // Fix warning error when implement redux-persist
  // https://stackoverflow.com/a/63244831/8324172
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
})
