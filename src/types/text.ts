export interface TextLayer {
  text:       string
  nx:         number  // normalized 0-1 horizontal click position in CSS layout space
  ny:         number  // normalized 0-1 vertical click position in CSS layout space
  fontSize:   number  // font size in display pixels
  fontFamily: string
  color:      string
  bold:       boolean
  italic:     boolean
  displayW:   number  // display pixel width used to scale font to canvas resolution
}
