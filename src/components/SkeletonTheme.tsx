import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function loadingSkeletonTheme(numOfRows: number) {
  return (
    <SkeletonTheme baseColor="#e2e5f8" highlightColor="#8186dc">
      <p>
        <Skeleton count={numOfRows} />
      </p>
    </SkeletonTheme>
  )
}
// purpleMain: "#8186dc",
//         purpleSoft: "#e2e5f8",
//         redMain: "#e83640",
//         redSoft: "#f9e5e4",
//         grayMain: "#6a6b6b",
//         grayMedium: "#bbbbba",
//         graySoft: "#e6e6e7",
//         graySoftest: "#efeeef",
