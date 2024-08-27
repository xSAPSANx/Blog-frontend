import React from 'react'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import SimpleMDE from 'react-simplemde-editor'
import { useSelector } from 'react-redux'
import { useNavigate, Navigate, useParams } from 'react-router-dom'

import 'easymde/dist/easymde.min.css'
import styles from './AddPost.module.scss'
import { selectIsAuth } from '../../redux/slices/auth'
import axios from '../../axios'

export const AddPost = () => {
	const navigate = useNavigate()
	const isAuth = useSelector(selectIsAuth)
	const { id } = useParams()

	const isEditing = Boolean(id)

	const [text, setText] = React.useState('')
	const [title, setTitle] = React.useState('')
	const [tags, setTags] = React.useState('')
	const [imageUrl, setImageYrl] = React.useState('')
	const [isLoading, setIsLoading] = React.useState(false)
	const inputFileRef = React.useRef(null)

	const handleChangeFile = async event => {
		try {
			const formData = new FormData()
			const file = event.target.files[0]
			formData.append('image', file)
			const { data } = await axios.post('/upload', formData)
			setImageYrl(data.url)
		} catch (error) {
			console.warn(error)
			alert('Ошибка при загрузке файла')
		}
	}

	const onClickRemoveImage = () => {
		setImageYrl('')
	}

	const onChange = React.useCallback(value => {
		setText(value)
	}, [])

	const onSubmit = async () => {
		try {
			setIsLoading(true)
			const fields = {
				title,
				imageUrl,
				tags: tags.split(','),
				text,
			}
			const { data } = isEditing ? await axios.patch(`/posts/${id}`, fields) : await axios.post('/posts', fields)

			const _id = isEditing ? id : data._id

			navigate(`/posts/${_id}`)
		} catch (error) {
			console.warn(error)
			alert('Ошибка создания статьи')
		}
	}

	React.useEffect(() => {
		if (id) {
			axios
				.get(`/posts/${id}`)
				.then(({ data }) => {
					setTitle(data.title)
					setText(data.text)
					setImageYrl(data.imageUrl)
					setTags(data.tags)
				})
				.catch(err => {
					console.warn(err)
					alert('Ошибка при получении статьи ')
				})
		}
	}, [])

	const options = React.useMemo(
		() => ({
			spellChecker: false,
			maxHeight: '400px',
			autofocus: true,
			placeholder: 'Введите текст...',
			status: false,
			autosave: {
				enabled: true,
				delay: 1000,
			},
		}),
		[]
	)

	if (!window.localStorage.getItem('token') && !isAuth) {
		return <Navigate to='/' />
	}

	return (
		<Paper style={{ padding: 30 }}>
			<Button onClick={() => inputFileRef.current.click()} variant='outlined' size='large'>
				Загрузить превью
			</Button>
			<input ref={inputFileRef} type='file' onChange={handleChangeFile} hidden />
			{imageUrl && (
				<>
					<Button variant='contained' color='error' onClick={onClickRemoveImage}>
						Удалить
					</Button>
					{imageUrl && <img className={styles.image} src={`http://localhost:4444${imageUrl}`} alt='Uploaded' />}
				</>
			)}

			<br />
			<br />
			<TextField
				classes={{ root: styles.title }}
				variant='standard'
				placeholder='Заголовок статьи...'
				value={title}
				onChange={e => setTitle(e.target.value)}
				fullWidth
			/>
			<TextField
				classes={{ root: styles.tags }}
				variant='standard'
				placeholder='Тэги'
				value={tags}
				onChange={e => setTags(e.target.value)}
				fullWidth
			/>
			<SimpleMDE className={styles.editor} value={text} onChange={onChange} options={options} />
			<div className={styles.buttons}>
				<Button onClick={onSubmit} size='large' variant='contained'>
					{isEditing ? 'Сохранить' : 'Опубликовать'}
				</Button>
				<a href='/'>
					<Button size='large'>Отмена</Button>
				</a>
			</div>
		</Paper>
	)
}
