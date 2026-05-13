import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  deleteAdminBackgroundAPI,
  fetchAdminBackgroundAPI,
  updateBlockBackgroundAPI
} from '~/apis/adminBackground.api'

export const useAdminBackground = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || 1)
  const rowsPerPage = Number(searchParams.get('limit') || 8)

  const [backgrounds, setBackgrounds] = useState([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedBackground, setSelectedBackground] = useState(null)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const updateQueryParams = useCallback(
    ({ nextSearch, nextPage, nextLimit }) => {
      const params = new URLSearchParams(searchParams)

      const finalSearch = nextSearch ?? search
      const finalPage = nextPage ?? page
      const finalLimit = nextLimit ?? rowsPerPage

      if (finalSearch) {
        params.set('search', finalSearch)
      } else {
        params.delete('search')
      }

      params.set('page', String(finalPage))
      params.set('limit', String(finalLimit))

      setSearchParams(params)
    },
    [searchParams, setSearchParams, search, page, rowsPerPage]
  )

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        setLoading(true)

        const data = await fetchAdminBackgroundAPI({
          search,
          page,
          limit: rowsPerPage
        })
        setBackgrounds(data.backgrounds || [])
        setTotalCount(data.totalCount || 0)
      } finally {
        setLoading(false)
      }
    }

    fetchBackgrounds()
  }, [search, page, rowsPerPage])

  const handleUpdateBlockBackground = useCallback(
    async (background) => {
      await updateBlockBackgroundAPI({ backgroundId: background._id })

      const data = await fetchAdminBackgroundAPI({
        search,
        page,
        limit: rowsPerPage
      })

      setBackgrounds(data.backgrounds || [])
      setTotalCount(data.totalCount || 0)
    },
    [search, page, rowsPerPage]
  )

  const handleSearchChange = useCallback(
    (event) => {
      updateQueryParams({
        nextSearch: event.target.value,
        nextPage: 1
      })
    },
    [updateQueryParams]
  )

  const handleChangePage = useCallback(
    (_, newPage) => {
      updateQueryParams({
        nextPage: newPage + 1
      })
    },
    [updateQueryParams]
  )

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      updateQueryParams({
        nextLimit: parseInt(event.target.value, 10),
        nextPage: 1
      })
    },
    [updateQueryParams]
  )

  const handleOpenDeleteModal = useCallback((background) => {
    setSelectedBackground(background)
    setDeleteModalOpen(true)
  }, [])

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false)
    setSelectedBackground(null)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    try {
      if (!selectedBackground) return

      await deleteAdminBackgroundAPI({ _id: selectedBackground._id })

      setBackgrounds((prev) =>
        prev.filter((item) => item._id !== selectedBackground._id)
      )

      setTotalCount((prev) => Math.max(prev - 1, 0))
      setDeleteModalOpen(false)
      setSelectedBackground(null)
    } catch (error) {
      setDeleteModalOpen(false)
      setSelectedBackground(null)
      console.log(error)
    }
  }, [selectedBackground])

  const handleEditBackground = useCallback(
    (background) => {
      navigate(`/admin/background/update/${background._id}`, {
        state: { backgroundData: background }
      })
    },
    [navigate]
  )

  const handleCreateBackground = useCallback(() => {
    navigate('/admin/background/create')
  }, [navigate])

  return {
    search,
    page: page - 1,
    rowsPerPage,
    backgrounds,
    totalCount,
    deleteModalOpen,
    selectedBackground,

    handleSearchChange,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleEditBackground,
    handleCreateBackground,
    handleUpdateBlockBackground
  }
}
